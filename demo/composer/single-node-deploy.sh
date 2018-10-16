
# Create the bna file
composer archive create --sourceType dir --sourceName . -a ./dist/stokes-network.bna

# Install the bna file
# composer network install --card PeerAdmin@hlfv1 --archiveFile ./dist/stokes-network.bna

# # Delete old card
# composer card delete --card admin@stokes-network

# # Start the network (BE SURE TO UPDATE NETWORK VERSION!)
# composer network start --networkName stokes-network --networkVersion 0.2.3 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card

# # Import the admin identity
# composer card import --file networkadmin.card

# # Ping to check for success
# composer network ping --card admin@stokes-network

# # Publish the network 
# composer-rest-server -c admin@stokes-network -n never -w true -p 3001