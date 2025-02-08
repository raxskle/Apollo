import Koa from "koa";
import { createServer } from "http";
import { Server } from "socket.io";
import { OTServer } from "./ot";
import { Operation } from "../src/lib/ot";
import Router from "koa-router";
import cors from "koa2-cors";
import { AuthUser } from "./types";
import { generateRandomString, getRandomColor } from "../src/utils";
import bodyParser from "koa-bodyparser";

process.on("uncaughtException", (error) => {
  console.error("捕捉到未捕获的异常:", error.message);
  // 可以在这里进行一些清理工作，然后退出进程
  // process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("捕捉到未处理的Promise拒绝:", reason, promise);
  // 可以在这里进行一些清理工作，然后退出进程
  // process.exit(1);
});

const app = new Koa();
app.use(
  cors({
    origin: "*", // 允许所有来源
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // 允许的HTTP方法
    allowHeaders: ["Content-Type", "Authorization", "Accept"], // 允许的请求头
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"], // 暴露的响应头
    maxAge: 500, // 预检请求的缓存时间（秒）
  })
);
app.use(bodyParser());

const router = new Router();
const httpServer = createServer(app.callback());
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// docId => OTServer
const DocsMapping = new Map<string, OTServer>();

// 登录步骤
// 弹窗http请求，昵称密码校验，返回前端userId，前端更新store user，
// socket连接时，可能还没登录，此时userId为空或map找不到用户，为防止这种情况，必须登陆后才能进入文档
// socket连接时，如果已经登录，带userId，对应到user
// 用户 userId => AuthUser
const UserMapping = new Map<string, AuthUser>();

const registerUser = (name: string, password: string) => {
  const id = generateRandomString(10);
  const displayColor = getRandomColor();
  UserMapping.set(id, {
    id: id,
    displayColor,
    name,
    password,
  });

  return { id, name, displayColor };
};

io.on("connection", (socket) => {
  // 连接
  // 根据docId寻找对应文档，不存在则创建
  console.log(
    "connection:: socketId:",
    socket.id,
    ", docId:",
    socket.handshake.auth.docId,
    ", userId:",
    socket.handshake.auth.userId
  );

  const docId = socket.handshake.auth.docId;
  const userId = socket.handshake.auth.userId;
  const user = UserMapping.get(userId) ?? {
    id: "unknown",
    name: "未知用户",
    displayColor: "grey",
  };

  if (!DocsMapping.has(docId)) {
    // 创建文档
    console.log("doc otServer init!!");
    DocsMapping.set(docId, new OTServer({ docId: docId, author: user }));
  }
  const otServer = DocsMapping.get(docId)!;

  // socket通过docId绑定到otServer，后续收发op不需要docId
  // 根据docId隔离客户端，io广播以docId为room
  socket.join(docId);

  otServer.clientConnect(socket, {
    id: user.id,
    name: user.name,
    displayColor: user.displayColor,
  });
  io.to(docId).emit("updateUserCount", { data: otServer.getClients() }); // 广播
  socket.emit("initialDocument", otServer.document);

  // 断开连接
  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);
    otServer.clientDisconnect(socket);
    io.to(docId).emit("updateUserCount", { data: otServer.getClients() });
    socket.leave(docId);
  });

  // 和Slate调用client的applyClient区分
  socket.on("opFormClient", (msg) => {
    console.log("opFormClient", msg);

    const toEmit = otServer.receiveOperation(Operation.formData(msg));

    setTimeout(() => {
      // 发送给其他客户端应用
      socket.broadcast.to(docId).emit("applyServer", toEmit);
    }, 2000);
    setTimeout(() => {
      // 回复ack
      socket.emit("serverAck", toEmit.operation);
    }, 2000);
  });

  // 修改文档标题
  socket.on("changeDocTitle", (msg) => {
    otServer.setDocumentTitle(msg);
    socket.broadcast.to(docId).emit("changeDocTitle", {
      title: msg,
      lastModified: otServer.getLastModified(),
    });
  });

  // 修改文档字体
  socket.on("changeDocFontFamily", (msg) => {
    otServer.setDocumentFontFamily(msg);
    socket.broadcast.to(docId).emit("changeDocFontFamily", {
      fontFamily: msg,
      lastModified: otServer.getLastModified(),
    });
  });

  // 增加评论
  socket.on("sendComment", (comment) => {
    const commentList = otServer.addComment(comment);
    io.to(docId).emit("updateComment", commentList);
  });

  // 远端用户选择，广播给其他用户
  socket.on("updateRemoteSelection", (msg) => {
    const client = otServer.getClient(socket.id);
    socket.broadcast.to(docId).emit("updateRemoteSelection", {
      focus: msg.focus,
      user: client?.user ?? {
        id: "unknown",
        name: "unknown",
        displayColor: "grey",
      },
    });
  });
});

router.get("/doclist", async (ctx) => {
  ctx.body = {
    list: [...DocsMapping.keys()].map((key) => {
      const doc = DocsMapping.get(key);
      const title = doc?.document.title;
      const lastModified = doc?.document.lastModified;
      return {
        title,
        lastModified,
        docId: key,
      };
    }),
  };
});

type LoginReq = {
  userName: string;
  password: string;
};

router.post("/login", async (ctx) => {
  const { userName, password } = ctx.request.body as LoginReq;

  UserMapping.forEach((user) => {
    if (user.name === userName) {
      if (user.password === password) {
        ctx.body = {
          data: {
            id: user.id,
            name: user.name,
            displayColor: user.displayColor,
          },
        };
      } else {
        ctx.body = {
          err: "密码错误",
        };
      }
    }
  });

  if (!ctx.body) {
    // 注册
    const user = registerUser(userName, password);
    ctx.body = {
      data: user,
    };
  }
});

app.use(router.routes()).use(router.allowedMethods());

httpServer.listen(3002, () => {
  console.log("listening on *:3002");
});

console.log("start server");
