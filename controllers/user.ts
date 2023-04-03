import { db } from "../db";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

interface UserInfoProps {
  id: number;
}

export const getUserInfo = (req: Request, res: Response) => {
  const newQuery =
    "SELECT users.username, users.image, users.bio, posts.* FROM posts INNER JOIN users ON posts.uid = users.id WHERE users.id = ?";

  db.query(newQuery, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data);
  });
};

export const updateUserInfo = (req: Request, res: Response) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err: Error, userInfo: UserInfoProps) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "UPDATE users SET `username`=?, `bio`=?, `image`=? WHERE id = ?";
    const values = [req.body.username, req.body.bio, req.body.image];

    db.query(q, [...values, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json("User has been updated.");
    });
  });
};
