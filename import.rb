require 'highline/import'
require 'mechanize'

# Decomoji Importer
class Importer
  BASE_DIR = File.expand_path(File.dirname(__FILE__))

  def initialize
    @page = nil
    @agent = Mechanize.new
  end
  attr_accessor :page, :agent

  def import_decomojis
    move_to_emoji_page
    upload_decomojis
  end

  private

  def login
    team_name  = ask('Your slack team name(subdomain): ')
    email      = ask('Login email: ')
    password   = ask('Login password(hidden): ') { |q| q.echo = false }

    emoji_page_url = "https://#{team_name}.slack.com/admin/emoji"

    page = agent.get(emoji_page_url)
    page.form.email = email
    page.form.password = password
    @page = page.form.submit
  end

  def enter_two_factor_authentication_code
    page.form['2fa_code'] = ask('Your two factor authentication code: ')
    @page = page.form.submit
  end

  def move_to_emoji_page
    loop do
      if page && page.form['signin_2fa']
        enter_two_factor_authentication_code
      else
        login
      end

      break if page.title.include?('Emoji')
      puts 'Login failure. Please try again.'
      puts
    end
  end

  def upload_decomojis
    Dir.glob("#{BASE_DIR}/dist/*.png").each do |path|
      basename = File.basename(path, '.*')

      # skip if already exists
      next if page.body.include?(":#{basename}:")

      puts "importing #{basename}..."

      form = page.form_with(action: '/customize/emoji')
      form['name'] = basename
      form.file_upload.file_name = path
      @page = form.submit
    end
  end
end

importer = Importer.new
importer.import_decomojis
puts 'Done!'
