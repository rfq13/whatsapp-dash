const paginatedResults = (model)=> {
    return async (req, res, next) => {
      const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
      const limit = parseInt(req.query.limit)
  
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
  
      const results = {
        start: startIndex+1,
        end: endIndex
      }
      
      const docsCounted = await model.where(req.params).countDocuments().exec();

      if (endIndex < docsCounted) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit
        }
      }
      try {
        results.results = await model.find(req.params).limit(limit).skip(startIndex).exec();  
        results.length = results.results.length;
        res.paginatedResults = results
        next()
      } catch (e) {
        res.status(500).json({ message: e.message })
      }
    }
}

module.exports = paginatedResults;