const jwt = require("jsonwebtoken");
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} = require("../config/index");
const RefreshToken = require("../models/token");

class JWTServices {
  //1. Sign Access Token
  static async signAccessToken(
    payload,
    expiryTime,
    secret = ACCESS_TOKEN_SECRET
  ) {
    return jwt.sign(payload, secret, { expiresIn: expiryTime });
  }
  //2. Sign Refresh Token
  static async signRefreshToken(
    payload,
    expiryTime,
    secret = REFRESH_TOKEN_SECRET
  ) {
    return jwt.sign(payload, secret, { expiresIn: expiryTime });
  }
  //3. Verify Access Token
  static async verifyAccessToken(token, secret = ACCESS_TOKEN_SECRET) {
    return jwt.verify(token, secret);
  }
  //4. Verify Refresh Token
  static async verifyRefreshToken(token, secret = REFRESH_TOKEN_SECRET) {
    return jwt.verify(token, secret);
  }
  //5. Store Refesh Token to db
  static async storeRefreshToken(token, userId) {
    try {
      const newToken = new RefreshToken({
        token,
        userId,
      });
      await newToken.save();
    } catch (error) {
      return next(error);
    }
  }
  //6. Update Refresh Token in db
  static async updateRefreshToken(token, userId) {
    await RefreshToken.updateOne(
      { token: token },
      { userId: userId },
      { upsert: true }
    );
  }

  //7. Delete Refresh Token in db
  static async deleteRefreshToken(token) {
    await RefreshToken.deleteOne({ token });
  }
}

module.exports = JWTServices;
