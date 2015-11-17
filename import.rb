require 'highline/import'
require 'mechanize'

BASE_DIR = File.expand_path(File.dirname(__FILE__))
agent = Mechanize.new
page = nil

loop do
  team_name  = ask('Your slack team name(subdomain): ')
  email      = ask('Login email: ')
  password   = ask('Login password(hidden): ') { |q| q.echo = false }

  emoji_page_url = "https://#{team_name}.slack.com/admin/emoji"

  page = agent.get(emoji_page_url)
  page.form.email = email
  page.form.password = password
  page = page.form.submit

  break if page.title.include?('Emoji')
  puts 'Login failure. Please try again.'
  puts
end

Dir.glob("#{BASE_DIR}/dist/*.png").each do |path|
  basename = File.basename(path, '.*')
  puts "importing #{basename}..."

  form = page.form_with(action: '/customize/emoji')
  form['name'] = basename
  form.file_upload.file_name = path
  page = form.submit
end

puts 'Done!'
