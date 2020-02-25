require 'highline/import'
require 'json'
require 'mechanize'

# sample command
#    dir: bundle exec ruby remove.rb basic
#    dir: bundle exec ruby remove.rb extra
#   json: bundle exec ruby remove.rb list_v4 json
#   json: bundle exec ruby remove.rb list_v5-preview0001 json
#   json: bundle exec ruby remove.rb list_v5-preview0001 json account.json
#   json: bundle exec ruby remove.rb preview dir account.json

require './remover'
remover = Remover.new(remove_target: ARGV[0], target_mode: ARGV[1], account: ARGV[2])
remover.serial
puts 'Done!'
