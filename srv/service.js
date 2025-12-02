const cds  = require("@sap/cds");
const { SELECT } = require("@sap/cds/lib/ql/cds-ql");

module.exports = class BookShopService extends cds.ApplicationService{
    init(){
        const { Books } = this.entities;
console.log("form service")
        this.before('CREATE', 'Books', async req => {
            const { ID } = req.data;
            if(!ID && ID !== 0) return;

            const exists = await SELECT.one.from(Books).where({ID});
            if(exists){
                req.error(409, `msg Book with ID ${ID} already exists`)
            }
        })
        return super.init()
    }
}

