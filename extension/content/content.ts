import dotenv from 'dotenv'
dotenv.config()

const main = (): void => {
  const fun = (): void => {
    console.log(process.env.TEST)
  }

  fun()
}

main()

// export default fun;
