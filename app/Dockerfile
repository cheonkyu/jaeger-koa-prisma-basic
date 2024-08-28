FROM node:19.8.1-slim

EXPOSE 4000

WORKDIR /usr/app

RUN npm install -g cross-env
# 캐싱
COPY package.json package.json
RUN yarn --production
# 코드 복사
COPY . .
# TimeZone 설정
ENV TZ Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
ENTRYPOINT [ "npm", "run", "start" ]