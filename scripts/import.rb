require 'highline/import'
require 'json'
require 'mechanize'

# Decomoji Importer
class Importer
  def initialize
    @page = nil
    @agent = Mechanize.new
  end
  attr_accessor :page, :agent, :team_name, :token

  def import_decomojis
    move_to_emoji_page
    upload_decomojis
  end

  private

  def login
    @team_name = ask('Your slack team name(subdomain): ')
    email      = ask('Login email: ')
    password   = ask('Login password(hidden): ') { |q| q.echo = false }

    emoji_page_url = "https://#{team_name}.slack.com/customize/emoji"

    page = agent.get(emoji_page_url)
    page.form.email = email
    page.form.password = password
    @page = page.form.submit
    @token = @page.body[/(?<=api_token:\s")[^"]+/]
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

      break if page.title.include?('絵文字') || page.title.include?('Emoji')
      puts 'Login failure. Please try again.'
      puts
    end
  end

  def upload_decomojis
    emojis = list_emojis
    Dir.glob(File.expand_path(File.dirname(__FILE__)) + "/../decomoji/basic/*.png").each do |path|
      basename = File.basename(path, '.*')

      # skip if already exists
      next if emojis.include?(basename)

      puts "importing #{basename}..."

      params = {
        name: basename,
        image: File.new(path),
        mode: 'data',
        token: token
      }
      agent.post("https://#{team_name}.slack.com/api/emoji.add", params)
    end
  end

  def list_emojis
    emojis = []
    loop.with_index(1) do |_, n|
      params = { query: '', page: n, count: 100, token: token }
      res = JSON.parse(agent.post("https://#{team_name}.slack.com/api/emoji.adminList", params).body)
      raise res['error'] if res['error']
      emojis.push(*res['emoji'].map { |e| e['name'] })
      break if res['paging']['pages'] == n || res['paging']['pages'] == 0
    end
    emojis
  end
end

importer = Importer.new
importer.import_decomojis
puts 'Done!'
