import { Router } from "express";
import User from "../models/user.js";
import { hash, compare } from 'bcrypt';
import jwt from "jsonwebtoken";
import secret from "../secret.js";
import authChecker from "../middleware/auth-checker.js";

const router = Router();

router.post("/signup", (_req, _res, _next) => {
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
                    created: true 
                });
            })
            .catch(e => {
                _res.status(500).json({error: e})
            });
    });
});

router.post("/login", (_req, _res, _next) => {
    let fetchedUser;

    User.find({ email: _req.body.email})
        .then(resolvedUser => {
            if (!resolvedUser) return _res.status(401).json({message: "Auth failed. Not resolved user."});
            fetchedUser = resolvedUser[0];
            return compare(_req.body.password, fetchedUser.password);
        }).then(result => {
            if (!result) return _res.status(401).json({message: "Auth failed. Password don't match."});
            const token = jwt.sign(
                {email: fetchedUser.email, userID: fetchedUser._id},
                secret,
                { expiresIn: '1h' }
            );
            _res.status(200).json({
                token: token,
                expiresIn: 3600,
                id: fetchedUser.tagname
            });
        }).catch(() => {
            return _res.status(401).json({message: "Auth failed."});
        });
});

router.get("/:tagname/friends", authChecker, async(_req, _res, _next) => {
    User.findOne({tagname: _req.params.tagname})
    .then(resolvedUser => {
        if (!resolvedUser || resolvedUser === null) return _res.status(401).json({message: "Not resolved user."});

        User.find({_id: { $in: resolvedUser.friends}})
        .then(fetchFriends => {
            _res.status(201).json({
                msg: 'Friends found!',
                friends: fetchFriends,
                success: true 
            })
        }).catch(e => {
            _res.status(500).json({error: e})
        });
    });
});


router.put("/add", authChecker,(_req, _res, _next) => {

    User.findOne({tagname: _req.body.tagname})
    .then(resolvedUser => {
        if (!resolvedUser) return _res.status(401).json({message: "Auth failed. Not resolved user."});
        User.findOne({tagname: _req.body.friendTagname}).then(friend => {
            if (!friend || friend === null) {
                return _res.status(401).json({message: "Auth failed. Not resolved user."});
            }
            resolvedUser.friends.push(friend);
            resolvedUser.save()
            .then(result => {
                _res.status(201).json({
                    msg: 'Friend added!',
                    addedStatus: true 
                });
            }).catch(e => {
                _res.status(500).json({
                    msg: 'Friend the friend with: '+_req.body.friendTagname+' tagname cannot be found!',
                    addedStatus: false,
                    error: e
                })
            });
        })
    });
});

router.put("/deleteFriend", authChecker, async(_req, _res, _next) => {
    try {
        const firendToDelete = await User.findOne({tagname: _req.body.friendTagname});
        await User.updateOne({tagname: _req.body.tagname}, {$pull: { friends: firendToDelete._id }});

        _res.status(201).json({
            msg: 'Friend deleted!',
            addedStatus: true 
        });
    } catch (e) {
        _res.status(500).json({
            msg: 'Friend the friend with: '+_req.body.friendTagname+' tagname cannot be found!',
            addedStatus: false,
            error: e
        })
    }
});

export default router;