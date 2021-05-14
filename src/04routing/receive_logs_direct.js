#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var conf = require('../../conf');

var args = process.argv.slice(2);

if (args.length == 0) {
    console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
    process.exit(1);
}

amqp.connect(conf, function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        var exchange = 'direct_logs';

        // direct_logs란 Exchange를 direct로 설정
        channel.assertExchange(exchange, 'direct', {
            durable: false
        });

        channel.assertQueue('', {

            //  단하나의 커넥션만 갖는 Queue로 선언 해당 Queue는 Consumer와 연결이 끊어지면 사라진다.
            exclusive: true
            
        }, function(error2, q) {
            if (error2) {
                throw error2;
            }
            console.log(' [*] Waiting for logs. To exit press CTRL+C');

            //  direct_logs란 Exchange에 여러개의 routing key를 bind
            args.forEach(function(severity) {
                channel.bindQueue(q.queue, exchange, severity);
            });

            channel.consume(q.queue, function(msg) {
                console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
            }, {
                noAck: true
            });
        });
    });
});