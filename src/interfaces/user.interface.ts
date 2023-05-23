export interface UserInterface {
    id?: number,
    fullname: string,
    email: string,
    username: string,
    password?: string,
    codusersap: string,
    status: string,
    created_at?: string,
    companyid?: number,
    areas?:any[],
    dependencias?:any[],
    almacenes?:any[]
}