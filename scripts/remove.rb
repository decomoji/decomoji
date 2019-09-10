require 'highline/import'
require 'json'
require 'mechanize'

require './remover'

remover = Remover.new
remover.serial
puts 'Done!'
