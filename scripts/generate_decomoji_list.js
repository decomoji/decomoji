'use strict'

let fs = require('fs')

const header = {
  basic: `# デコモジ基本セット\n\nすぐに使えてSlackが楽しくなる基本セットです。\n\n`,
  extra: `# デコモジ拡張セット\n\n作りたいと思った気持ちのままに作った拡張セットです。使い方にご注意ください。\n\n`
}


function generate_decomoji_list(type) {
  fs.readdir(`./decomoji/${type}/`, (error, files) => {
    if (error) {
      throw error
    }

    let text = ''

    files.forEach((file) => {
      if (file === '.DS_Store') return
      text += `![${file.split('.')[0]}](./decomoji/${type}/${file})`
    })

    fs.writeFile(`./decomoji-${type}.md`, header[type]+text, (err) => {
      if (err) throw err;
      console.log(`decomoji-${type}.md has been saved!`);
    })
  })
}

generate_decomoji_list('basic')
generate_decomoji_list('extra')