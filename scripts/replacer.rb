# Decomoji Replacer
class Replacer
  DEFAULT_IMPORT_TARGET = "basic"
  DEFAULT_REMOVE_TARGET = "v4-basic.json"

  def initialize(remove_target: nil, import_target: nil, account: nil)
    @page = nil
    @agent = Mechanize.new
    @remove_target = remove_target || DEFAULT_REMOVE_TARGET
    @import_target = import_target || DEFAULT_IMPORT_TARGET
    @account = JSON.parse("{}")
    if account
      @account = open(account) do |data|
        JSON.load(data)
      end
    end
  end
  attr_accessor :page, :agent, :team_name, :token

  def serial
    ask_team_name
    move_to_emoji_page
    remove_decomojis
    upload_decomojis
  end

  private

  def ask_team_name
    begin
      @team_name = @account ? @account['team_name'] : ask('Your slack team name(subdomain): ')
      agent.get("https://#{team_name}.slack.com")
    rescue
      puts "Not found workspace. Please try again."
      @account['team_name'] = ask('Your slack team name(subdomain): ')
      retry
    end

    puts "Team: #{@team_name}"
  end

  def ask_login_info
    @email      = @account ? @account['email'] : ask('Login email: ')
    @password   = @account ? @account['password'] : ask('Login password(hidden): ') { |q| q.echo = false }

    puts "User: #{@email}"
    puts "Pass: ****************"
  end

  def login
    emoji_page_url = "https://#{team_name}.slack.com/customize/emoji"

    agent = Mechanize.new
    page = agent.get(emoji_page_url)
    page.form.email = @email
    page.form.password = @password
    @page = page.form.submit
    @token = @page.body[/(?<=api_token":")[^"]+/]
  end

  def enter_two_factor_authentication_code
    page.form['2fa_code'] = ask('Your two factor authentication code: ')
    @page = page.form.submit
    @token = @page.body[/(?<=api_token":")[^"]+/]
  end

  def move_to_emoji_page
    loop do
      if page && page.form['signin_2fa']
        @is_two_factor = true
        enter_two_factor_authentication_code
      else
        ask_login_info
        login
      end

      break if page.title.include?('絵文字') || page.title.include?('Emoji')
      puts 'Login failure. Please try again.'
      puts
      @account['email'] = ask('Login email: ')
      @account['password'] = ask('Login password(hidden): ') { |q| q.echo = false }
    end
  end

  def remove_decomojis
    emojis = list_emojis
    
    files = nil
    File.open(File.expand_path(File.dirname(__FILE__)) + "/" + @remove_target) do |file|
      files = JSON.load(file)
    end

    len = files.length
    if len === 0
      puts 'Target Files not found.'
      return
    end
    files.each.with_index(1) do |hash, i|
      basename = @target_mode === 'json' ? hash : File.basename(hash, '.*')

      # skip if not found
      unless emojis.include?(basename)
        puts "[Skip] (#{i}/#{len}) #{basename} not found"
        next
      end

      puts "[Load] (#{i}/#{len}) removing #{basename}..."

      begin
        params = {
          name: basename,
          token: token
        }
        response = agent.post("https://#{team_name}.slack.com/api/emoji.remove", params)
      rescue Mechanize::ResponseCodeError => e
        if @is_two_factor
          retry_after = e.page.header['retry-after']
          if e.page.code != "429" or retry_after.nil?
            raise e
          end
          puts "Too Many Requests. Retry after " + retry_after +  " sec."
          sleep(retry_after.to_i)
          retry
        else
          login
          retry
        end
      end
    end

    puts "Remove '#{@remove_target}' done!"
  end

  def upload_decomojis
    emojis = list_emojis
    files = Dir.glob(File.expand_path(File.dirname(__FILE__)) + "/../decomoji/" + @import_target + "/*.png")
    len = files.length
    files.each.with_index(1) do |path, i|
      basename = File.basename(path, '.*')

      # skip if already exists
      if emojis.include?(basename)
        puts "[Skip] (#{i}/#{len}) #{basename} already exists"
        next
      end

      puts "[Load] (#{i}/#{len}) importing #{basename}..."

      begin
        params = {
          name: basename,
          image: File.new(path),
          mode: 'data',
          token: token
        }
        response = agent.post("https://#{team_name}.slack.com/api/emoji.add", params)
      rescue Mechanize::ResponseCodeError => e
        if @is_two_factor
          retry_after = e.page.header['retry-after']
          if e.page.code != "429" or retry_after.nil?
            raise e
          end
          puts "Too Many Requests. Retry after " + retry_after +  " sec."
          sleep(retry_after.to_i)
          retry
        else
          login
          retry
        end
      end
    end

    puts "Import '#{@import_target}' done!"
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
