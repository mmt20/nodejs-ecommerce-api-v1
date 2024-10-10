class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    const queryStringObj = { ...this.queryString };
    const excludesFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
    excludesFields.forEach((field) => delete queryStringObj[field]);

    // Apply filteration using [gte , gt , lte , lt ]
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in)\b/g,
      (match) => `$${match}`
    );

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }
    return this;
  }

  search(modelName) {
    let query = {};
    if (modelName === 'Products') {
      query.$or = [
        { title: { $regex: this.queryString.keyword, $options: 'i' } },
        {
          description: { $regex: this.queryString.keyword, $options: 'i' },
        },
      ];
    } else {
      query = { name: { $regex: this.queryString.keyword, $options: 'i' } };
    }
    if (this.queryString.keyword) {
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  paginate(documentLength) {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || documentLength;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // Pagination result
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(documentLength / limit);

    // next page
    if (endIndex < documentLength) {
      pagination.next = page + 1;
    }
    // prev page
    if (skip > 0) {
      pagination.prev = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;

    return this;
  }
}

module.exports = ApiFeatures;
