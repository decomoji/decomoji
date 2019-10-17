'use strict'

let fs = require('fs')

function generate_decomoji_ts(type) {
  fs.readdir(`./decomoji/${type}/`, (err, files) => {
    if(err) {
      if (err.code === 'ENOENT') {
        files = ['.DS_Store']
      } else {
        throw err
      }
    }

    const decomoji_array = files.reduce((memo, file) => {
      return file === '.DS_Store' ? memo : memo.concat(file.split('.')[0])
    }, [])

    if (!fs.existsSync('./ts')) fs.mkdirSync('./ts')

    fs.writeFile(
      `./ts/${type}.ts`,
      `export const DECOMOJI_${type.toUpperCase()} = ` +
        JSON.stringify(decomoji_array),
      err => {
        if (err) throw err
        console.log(`${type}.ts has been saved!`)
      }
    )
  })
}

generate_decomoji_ts('basic')
generate_decomoji_ts('extra')
generate_decomoji_ts('explicit')
