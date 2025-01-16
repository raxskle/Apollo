// OT算法的服务端

class OTClient {
  constructor() {}
}

export class OTServer {
  clients: Map<string, OTClient>;
  constructor() {
    this.clients = new Map();
  }
}
