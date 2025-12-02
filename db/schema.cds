namespace com.bookshop;

entity Books{
    key ID : Integer;
    title : String(111);
    author : String(111);
    price : Decimal(9, 2);
    stock : Integer;
}

