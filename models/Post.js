const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    //文章
    desc: {
      type: String,
      max: 200,
    },
    //画像のパス指定
    img: {
      type: String,
    },
    //誰が良いね押したか入れるのでArray
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
