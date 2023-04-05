const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
//router.post("/", async (req, res) => {
//req.bodyスキーマ全部
// 登録
router.post("/", async (req, res) => {
  const newPost = await new Post(req.body);
  try {
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});
//投稿の更新
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({
        $set: req.body,
      });
      return res.status(200).json("投稿編集に成功しました");
    } else {
      return res.status(403).json("あなたは他の人の投稿を編集できません。");
    }
  } catch (err) {}
  return res.status(403).json(err);
});

//投稿の削除
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      return res.status(200).json("投稿削除に成功しました");
    } else {
      return res.status(403).json("あなたは他の人の投稿を削除できません。");
    }
  } catch (err) {
    return res.status(403).json(err);
  }
});

//投稿の取得する。
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch (err) {
    return res.status(403).json(err);
  }
});

//投稿の投稿に良いねをする。
router.put("/:id/like", async (req, res) => {
  //自分自身のユーザーid と　フォローするuser id　が等しくない場合にフォローできる。
  try {
    //eq.params.id 投稿のid
    const post = await Post.findById(req.params.id);
    //今からフォローしに行くユーザーのフォロワーを見に行く。自分自身が含まれているかをincludesに見に行く。
    //まだ投稿にいいねが押されてなかったらオス。
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({
        //push追加。スキーマのfollowers配列に追加していく。
        $push: {
          likes: req.body.userId,
        },
      });
      return res.status(200).json("いいねに成功しました！");
      //投稿にすでにいいねが押されていたら
    } else {
      await post.updateOne({
        //pull 取り除く
        $pull: {
          likes: req.body.userId,
        },
      });
      return res.status(403).json("投稿にいいねを外しました。");
    }
  } catch (err) {
    return res.status(500).json("おいおおい");
  }
});

//プロフィール専用のタイムラインの取得
router.get("/profile/:username", async (req, res) => {
  try {
    //どの人が投稿したのか判断
    const user = await User.findOne({ username: req.params.username });
    //投稿した人(currentUser._id)の投稿をすべて取得するために、postスキーマのuserIdにurrentUser._idを渡してる。
    const posts = await Post.find({ userId: user._id });
    //concat　組み合わせる。　スプレッド構文で配列をすべて表示。
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//タイムラインの投稿を取得
router.get("/timeline/:userId", async (req, res) => {
  try {
    //どの人が投稿したのか判断
    const currentUser = await User.findById(req.params.userId);
    //投稿した人(currentUser._id)の投稿をすべて取得するために、postスキーマのuserIdにurrentUser._idを渡してる。
    const userPosts = await Post.find({ userId: currentUser._id });
    //自分がフォローしている友達の投稿内容をすべて取得
    //Promise.all は非同期処理で取られてくる情報をまってあげるためのもの。
    //friendIdに特定のユーザー（currentUser.followings）がフォローしている人を全員mapで入れる。
    //そのidのPostを取得。
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    //concat　組み合わせる。　スプレッド構文で配列をすべて表示。
    return res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    return res.status(500).json(err);
  }
});
module.exports = router;
