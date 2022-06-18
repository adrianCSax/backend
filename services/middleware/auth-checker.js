import { verify } from "jsonwebtoken";
import secret from "../secret";

export default (_req, _res, _next) => {
    try {
        const token = _req.headers.authorization.split(" ")[1];
        verify(token, secret);
        _next();
    } catch (error) {
        _res.status(401).json({message: "Bearer fails!"});
    }
}