import { Router } from "express";
import User from "../models/user.js";
import { hash, compare } from 'bcrypt';
import jwt from "jsonwebtoken";
import secret from "../secret.js";

const router = Router();

router.post("/singup", (_req, _res, _next) => {
    hash(_req.body.password, 10)
    .then(cryptedPassword => {
        const user = new User({
            tagname: _req.body.tagname,
            email: _req.body.email,
            password: cryptedPassword
        });
        user.save()
            .then(result => {
                _res.status(201).json({
                    msg: 'User created!',
                    result: result
                });
            })
            .catch(e => {
                _res.status(500).json({error: e})
            });
    });
});

router.post("/login", (_req, _res, _next) => {
    let fetchedUser;
    let notSuccess = _res.status(401).json({message: "Auth failed"});

    User.find({ email: _req.body.email})
        .then(resolvedUser => {
            if (!resolvedUser) return notSuccess;
            fetchedUser = resolvedUser;
            return compare(_req.body.password, resolvedUser.password);
        }).then(result => {
            if (!result) return notSuccess;
            const token = jwt.sign(
                {email: fetchedUser.email, userID: fetchedUser._id},
                secret,
                { expiresIn: '1h' }
            );
            _res.status(200).json({
                token: token,
                expiresIn: 3600
            })
        }).catch(() => {
            return notSuccess;
        });
});

export default router;