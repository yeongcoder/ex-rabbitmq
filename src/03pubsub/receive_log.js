#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var conf = require('../../conf');

amqp.connect(conf, function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        var exchange = 'logs';

        //  Exchange 생성
        channel.assertExchange(exchange, 'fanout', {
            durable: false
        });

        //  랜덤네임을 갖는 Queue생성
        channel.assertQueue('', {
            
            //  단하나의 커넥션만 갖는 Queue로 선언 해당 Queue는 Consumer와 연결이 끊어지면 사라진다.
            exclusive: true

        }, function(error2, q) {
            if (error2) {
                throw error2;
            }
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);

            //  생성된 Queue를 Exchange에 연결 (Subscribe)
            channel.bindQueue(q.queue, exchange, '');

            //  메시지 받기
            channel.consume(q.queue, function(msg) {
                if (msg.content) {
                    console.log(" [x] %s", msg.content.toString());
                }
            }, {
                noAck: true
            });
        });
    });
});