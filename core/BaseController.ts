import Utility from "../helpers/utility";
import { Filter_Options, Response, Request } from "../__types";
const saltedSha256 = require("salted-sha256");

export class BaseController extends Utility {
  /**
   * @class BaseController
   * @method render
   * @protected
   *
   * @param {Response} res
   * @param {number} statusCode
   * @param {object} data
   *
   * @return {Response}
   */

  errors: { [key: string]: string } = {
    create: "Unable to create %",
    add: "Unable to add %",
    update: "Unable to update %",
    save: "Unable to save %",
    list: "Unable to load %",
    get: "Unable to load %",
    exist: "% already exist",
    delete: "Can't delete this %, Error occurred",
    remove: "Can't this this %, Error occurred",
    dontexist: "% doesn't exist",
    login: "Please Login to continue",
    signup: "Cannot Signup right now please try later.",
    token: "Failed to authenticate token.",
    permissions: "you don't have permission",
    invalid: "Invalid Email or Password",
  };
  constructor() {
    super();
  }

  protected json = (
    res: Response,
    statusCode: number,
    data?: object | null
  ): Response => {
    if (!data) {
      return res.sendStatus(statusCode);
    }
    return res.status(statusCode).json(data);
  };

  protected error = (component: string, error) => {
    if (this.errors[error]) {
      return {
        error: true,
        success: false,
        message: this.errors[error].replace(
          /%/g,
          component.charAt(0).toUpperCase() + component.slice(1)
        ),
      };
    } else {
      return { error: true, success: false, message: error };
    }
  };

  protected exception = async (
    req: Request,
    res: Response,
    e,
    component,
    error
  ) => {
    if (e) {
      if (global["config"].pushError) {
      } else {
        console.log(e);
      }
    }
    return this.json(res, 400, this.error(component, error));
  };

  protected salt = (): string => {
    const firstString = Utility.randomString(39);
    const number = Math.floor(Math.random() * 30) + 10;
    const secondString = Utility.randomString(39);
    return firstString + number + secondString;
  };

  private secretSalt = (salt: string): string => {
    const saltN = parseInt(salt.substr(39, 41));
    return global["config"].secret.substr(saltN, 100);
  };

  protected passwordEn = (
    password: string,
    salt?: string
  ): { password: string; salt: string } => {
    const Ro = { password: "", salt: "" };
    if (!salt) {
      salt = this.salt();
    }
    Ro.salt = salt;
    const enpass = saltedSha256(password, salt);
    Ro.password = saltedSha256(enpass, this.secretSalt(salt));
    return Ro;
  };

  protected getAggregation = (
    req: Request,
    filter_options: Filter_Options,
    defaultFilter: object = {}
  ) => {
    let { search, defaultSort, filters } = filter_options;
    const data = defaultFilter;
    req.aggregations = [];
    req.dbPagination = [];
    Object.keys(req.query).forEach((field) => {
      if (filters[field]) {
        const { type, filter } = filters[field];
        let value: any = req.query[field];
        if (type == "boolean") {
          value = JSON.parse(value.toLowerCase());
        }
        if (filter === "$in") {
          value = value.split(",");
          if (type === "int") {
            value = value.map((str) => {
              return parseInt(str);
            });
          }
        } else if (type === "int") {
          value = parseInt(value);
        }
  
        if (filter === "eq") {
          data[field] = value;
        } else {
          if (!data[field]) {
            data[field] = {};
          }
          data[field][filter] = value;
        }
      }
    });
    // if (req.user && req.user.role?.name.indexOf("Admin") === -1) {
    // 	data["created_by"] = new ObjectId(req.user._id);
    // }
    if (req.query["q"]) {
      const q = req.query["q"].toString();
      if (search.length > 0) {
        const se = search.map((e) => {
          const se = {};
          se[e] = new RegExp(q);
          return se;
        });
        data["$or"] = se;
      }
    }
    if (Object.keys(data).length > 0) {
      req.dbPagination.push({
        $match: data,
      });
      req.aggregations.push({
        $match: data,
      });
    }
  
    let rawParm;
    if (req.query["orderby"]) {
      rawParm = req.query["orderby"];
    } else {
      rawParm = defaultSort;
    }
  
    let order = 1;
    if (req.query["orderdir"]) {
      order = parseInt(req.query["orderdir"].toString());
    }
    let sort = {};
    sort[rawParm] = order;
    req.aggregations.push({
      $sort: sort,
    });
  
    // Pagination
    let page = 1;
    let page_size = global["config"].pagination.page_size;
    if (req.query["page"]) {
      page = parseInt(req.query["page"].toString());
    }
    if (req.query["limit"]) {
      page_size = parseInt(req.query["limit"].toString());
    }
    if (page) {
      page = page - 1;
    }
  
    if (page_size > global["config"].pagination.maxLimit) {
      page_size = global["config"].pagination.maxLimit;
    }
    const skip = page * page_size;
  
    // Pagination
    req.aggregations.push({ $skip: skip }, { $limit: page_size });
    req.dbPagination.push({
      $facet: {
        pagination: [
          { $count: "total" },
          { $addFields: { page: page + 1, page_size: page_size } },
        ],
      },
    });
  }
}
