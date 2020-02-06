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

  static async getArticles(req, resp) {
    let page = +req.query.page;
    page = Number.isFinite(+page) && +page > 0 ? page : 1;
    let pageLimit = +req.query.pageLimit;
    pageLimit = Number.isFinite(pageLimit) && pageLimit > 0 ? pageLimit : 20;
    const offset = (page - 1) * pageLimit;

    const data = await Article.findAndCountAll({
      include: {
        model: User,
        as: 'author',
        attributes: ['name', 'email', 'id'],
      },
      attributes: ['id', 'title', 'description', 'coverImage', 'createdAt', 'updatedAt'],
      offset,
      limit: pageLimit,
    });
    return resp.status(200).json({
      message: 'Successfully retrieved articles',
      data: data.rows,
      meta: {
        currentPage: page,
        pageLimit,
        totalObjects: data.count,
        totalObjectsInPage: data.rows.length,
      },
    });
  }
}
