#!/usr/bin/env node

var amqp = require('amqplib/callback_api');
var conf = require('../../conf');

amqp.connect(conf, function(error, connection) {
    connection.createChannel(function(error, channel) {
        var queue = 'task_queue';

        channel.assertQueue(queue, {

            //  영구적인 큐로 설정
            durable: true 

        });

        //  ark가 완료되지 않으면 메세지를 받지않게 설정
        channel.prefetch(1);

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, function(msg) {
            var secs = msg.content.toString().split('.').length - 1;

            console.log(" [x] Received %s", msg.content.toString());
            setTimeout(function() {
                console.log(" [x] Done");

                //  ack 전송
                channel.ack(msg);

            }, secs * 1000);
        }, {

            // 수동 ack로 설정
            noAck: false

        });
    });
});