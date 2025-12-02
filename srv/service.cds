using { com.bookshop as db } from '../db/schema';

service BookShopService {

    entity Books as projection on db.Books;

}
