class ApiFeatures {
  constructor(query, queryobj) {
    this.query = query;
    this.queryobj = queryobj;
  }
  filtering() {
    const queryobj = { ...this.queryobj };
    const excluded = ['sort', 'page', 'limit', 'fields'];
    excluded.forEach((element) => delete queryobj[element]);

    let querystr = JSON.stringify(queryobj);
    querystr = querystr.replace(/\b(gt|lt|gte|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(querystr));
    return this;
  }
  projection() {
    if (this.queryobj.fields) {
      const fields = this.queryobj.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pageing() {
    const page = this.queryobj.page * 1 || 1;
    const limit = this.queryobj.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
  sort() {
    if (this.queryobj.sort) {
      const sortedby = this.queryobj.sort.split(',').join(' ');
      this.query = this.query.sort(sortedby);
    }
    return this;
  }
}

module.exports = ApiFeatures;
