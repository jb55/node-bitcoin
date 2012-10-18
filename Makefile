VOWS=./node_modules/.bin/vows
BOX=test/testnet-box

test:
	$(MAKE) start
	sleep 15
	$(MAKE) run-test
	$(MAKE) stop
	
start:
	$(MAKE) -C $(BOX) start
	
stop:
	$(MAKE) -C $(BOX) stop
	
run-test:
	$(VOWS) --spec test/api.js
	
clean:
	$(MAKE) -C $(BOX) clean

.PHONY: test
