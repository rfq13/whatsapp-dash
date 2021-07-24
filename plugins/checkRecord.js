module.exports = function check(schema, options) {
    schema.statics.check = async function (query) {
        const result = await this.findOne(query).select("_id").lean();
        return result ? true : false;
    };
}