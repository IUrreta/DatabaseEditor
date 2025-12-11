import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default function handler(req, res) {
  const { auth_token } = req.cookies || {};

  if (!auth_token) {
    return res.status(200).json({ ok: true, valid: false });
  }

  try {
    const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);

    if (!decoded.patreonId) {
      // Delete cookie
      const del = serialize("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0),
        path: "/",
      });

      res.setHeader("Set-Cookie", del);
      return res.status(200).json({ ok: true, valid: false });
    }

    return res.status(200).json({ ok: true, valid: true });
  } catch (err) {
    // Bad cookie → borrar también
    const del = serialize("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    });

    res.setHeader("Set-Cookie", del);
    return res.status(200).json({ ok: true, valid: false });
  }
}
