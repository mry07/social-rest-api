import Auth from "../../middlewares/auth";
import Routes from "../app-server/routes";
import Express from "express";
import Headers from "../../middlewares/headers";
import * as Path from "path";
import * as Error from "../../error";

const Server = Express();

// middleware
Server.use("/uploads", Express.static(Path.join(process.cwd(), "uploads")));
Server.use(Express.json());
Server.use(Headers);
Server.use(Auth([]));

// route
Server.use("/api/v1", Routes);

// error handler
Server.use(Error.handler);
Server.use(Error.endpointError);

export default Server;