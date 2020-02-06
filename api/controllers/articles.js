import { format } from 'util';
import { Article, User } from '~/database/models';
import { CREATED_MSG } from '~/api/utils/constants';

export default class ArticleController {
  static async createArticle(req, resp) {
    const { tokenData } = req;

    const user = await User.findOne({
      where: { email: tokenData.email },
    });
    const articleObj = {
      ...req.body,
      authorId: user.id,
    };
    const article = await Article.create(articleObj);
    return resp.status(201).json({
      status: 'success',
      data: article,
      message: format(CREATED_MSG, 'Article'),
    });
  }
}
