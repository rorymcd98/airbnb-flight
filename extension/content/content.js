import dotenv from 'dotenv';
dotenv.config();
const main = () => {
    const fun = () => {
        console.log(process.env.TEST);
    };
    fun();
};
main();
// export default fun;
