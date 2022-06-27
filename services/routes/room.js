import Room from "../models/room.js";
import User from "../models/user.js";
import { Router } from "express";
import authChecker from "../middleware/auth-checker.js";
import room from "../models/room.js";

const router = Router();

router.post(
  "/add",
  authChecker,
  async (req, res, _next) => {
    let participants;
    let admin;
    participants = req.body.room.participants.map((participant) => {
      return participant.tagname;
    });

    try {
      participants = await User.find({tagname: { $in: participants}});
      participants = participants.map((participant) => {
        return participant._id;
      });
      admin = await User.findOne({tagname: req.body.room.admin});
    } catch (e) {
      res.status(500).json({error: e});
    }

    const room = new Room({
      name: req.body.room.name,
      admin: admin._id,
      description: req.body.room.description,
      tags: req.body.room.tags,
      participants: participants
    });

    room.save().then(async (newRoom) => {
      let participantsTags;
      let adminTag;

      try {
        participantsTags = participants.map(async (participant) => {
          await User.updateOne({_id: participant}, { $push: { rooms: newRoom._id }});
          return {
            tagname: participant.tagname
          }
        });
        await User.updateOne({_id: admin._id}, { $push: { rooms: newRoom._id }});
        adminTag = admin.tagname;
      } catch (e) {
        res.status(500).json({error: e})
      }

      res.status(201).json({
        message: "Room created successfully",
        room: {
          name: newRoom.name,
          admin: adminTag,
          description: newRoom.description,
          tags: newRoom.tags,
          participants: participantsTags
        }
      });
    });
  }
);

router.delete("/delete/:room/:user", authChecker, async (req, res, _next) => {
  const roomToDelete = await Room.findById(req.params.room);
  const admin = await User.findOne({tagname: req.params.user});

  if (roomToDelete.admin.toString() !== admin._id.toString()) {
    return res.status(500).json({error: "You don't have the credentials"});
  }

  try {
    roomToDelete.participants.map(async (participant) => {
      await User.updateOne({_id: participant}, { $pull: { rooms: roomToDelete._id }});
    });

    await Room.deleteOne({_id: roomToDelete._id});

    res.status(201).json({
      msg: 'Room deleted!',
      success: true 
    });
  } catch (e) {
    res.status(500).json({error: e});
  }

});

router.put("/edit", authChecker, async (req, res, _next) => {
  const roomToEdit = await Room.findById(req.body.room.id);
  let oldParticipants = roomToEdit.participants;
  let newParticipants;

  if (req.body.room.admin !== req.body.user) {
    return res.status(500).json({error: "You don't have the credentials"});
  }

  newParticipants = req.body.room.participants.map((participant) => {
    return participant.tagname;
  });

  try {
    newParticipants = await User.find({tagname: { $in: newParticipants}});
    newParticipants = newParticipants.map((participant) => {
      return participant._id;
    });
  } catch (e) {
    res.status(500).json({error: e});
  }

  roomToEdit.participants = newParticipants;
  roomToEdit.description = req.body.room.description;
  roomToEdit.tags = req.body.tags;

  roomToEdit.save().then(async (editedRoom) => {
    let toAdd = newParticipants.map(el => el.toString());
    let toRemove = oldParticipants.map(el => el.toString());
    let toAddSet = new Set(toAdd);
    let toRemoveSet = new Set(toRemove);


    toAdd = toAdd.filter(el => !toRemoveSet.has(el));
    toRemove = toRemove.filter(el => !toAddSet.has(el));

    console.log(toRemove);
    console.log(toAdd);

    try {
      toAdd.map(async (participant) => {
        console.log(await User.updateOne({_id: participant}, { $push: { rooms: editedRoom._id }}));
      });
      toRemove.map(async (participant) => {
        console.log(await User.updateOne({_id: participant}, { $pull: { rooms: editedRoom._id }}));
      });
    } catch (e) {
      res.status(500).json({error: e})
    }

    res.status(201).json({
      message: "Room edit successfully"
    });
  });
})

router.get("/:tagname/rooms", authChecker, async(req, res, _next) => {
  try {
    let user = await User.findOne({tagname: req.params.tagname});
    if (!user || user === null) return res.status(401).json({message: "Not resolved user."});
    let rooms = await Room.find({_id: { $in: user.rooms }});

    rooms = Promise.all(rooms.map((room) => {
      return getRoomInfo(room).then(fetchedRoom => fetchedRoom);
    }));

    res.status(201).json({
        msg: 'Rooms found!',
        rooms: await rooms,
        success: true 
    });
  } catch (e) {
    res.status(500).json({error: e})
  }
});

async function getRoomInfo(room) {
  let participants = await User.find({_id: room.participants });
  participants = participants.map((participant) => {
    return {
      tagname: participant.tagname
    }
  });
  let admin = await User.findById(room.admin);

  return {
    id: room._id,
    name: room.name,
    admin: admin.tagname,
    description: room.description,
    tags: room.tags,
    participants: participants
  }
}

export default router;