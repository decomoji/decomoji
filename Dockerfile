FROM ruby:2.5.1
ENV LANG C.UTF-8

RUN apt-get update -qq && apt-get install -y \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

RUN gem install bundler

ENV APP_HOME /myapp
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME
ADD . $APP_HOME

WORKDIR $APP_HOME/scripts
RUN bundle install
