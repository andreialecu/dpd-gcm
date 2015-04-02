# GCM Push notifications for Deployd

## Install

	npm install dpd-gcm --save

## Usage

	dpd.resourcename.post(
		{
			message:"Your message here",
			devices:["deviceID1","deviceID2", ...]
		}, function(result, err){}
	)
