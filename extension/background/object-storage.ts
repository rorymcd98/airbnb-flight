import fs from 'fs'

export function saveObjectToFile (obj: object, filePath: string) {
  // Convert the object to a JSON string
  const jsonString = JSON.stringify(obj)

  // Write the JSON string to the file
  fs.writeFile(filePath, jsonString, (err) => {
    if (err != null) {
      console.error('Error writing object to file:', err)
    } else {
      console.log('Object saved to file:', filePath)
    }
  })
}

export async function loadObjectFromFile (filePath: string) {
  try {
    const data = await fs.promises.readFile(filePath)
    const obj = JSON.parse(data.toString())
    console.log('Object loaded from file')
    return obj
  } catch (err) {
    console.error('Error reading or parsing object from file:', err)
    throw err
  }
}
