#!/bin/bash
#Author: Wilson Li
#Version: v.0.0.2

ROOTDIR=/home/ubuntu/fabric-samples
WORKDIR=${ROOTDIR}/first-network/imscripts
LINKDIR=${ROOTDIR}/first-network
CONSORTIUM=CryptoAnchor
ORG1=IMInc
ORG1_low=iminc
DOMAIN=imblockchain.com
ORG2=Org2
ORG2_low=org2

MOD_LIST="docker-compose-e2e-template.yaml docker-compose-couch.yaml docker-compose-cli.yaml docker-compose-cas-template.yaml crypto-config.yaml configtx.yaml byfn.sh docker-compose-base.yaml script.sh byfn-network.json"
rm ${WORKDIR}/im**

for i in `echo ${MOD_LIST}`
do
	cp ${WORKDIR}/${i} ${WORKDIR}/im_${i}

	sed -i -e 's/SampleConsortium/'"${CONSORTIUM}"'/g' ${WORKDIR}/im_${i}
	sed -i -e 's/Org1/'"${ORG1}"'/g' ${WORKDIR}/im_${i}
	sed -i -e 's/org1/'"${ORG1_low}"'/g' ${WORKDIR}/im_${i}
	sed -i -e 's/example.com/'"${DOMAIN}"'/g' ${WORKDIR}/im_${i}
		
	#echo "-${i}-" is completed
	
	if [ $i = docker-compose-base.yaml ]
	then
		echo "Working on ${LINKDIR}/base/${i}..."
		if [ -h ${LINKDIR}/base/${i} ]
		then
			#echo ${LINKDIR}/base/${i} is there
                        echo ${LINKDIR}/base/${i} verified
		else
			ln -s ${WORKDIR}/im_${i} ${LINKDIR}/base/${i}
		fi
	elif [ $i = script.sh ]
	then
		echo "Working on ${LINKDIR}/scripts/${i}..."
		rm ${LINKDIR}/scripts/${i}
		cp ${WORKDIR}/im_${i} ${LINKDIR}/scripts/${i}
        elif [ $i = byfn-network.json ]
        then
                echo "Working on ${LINKDIR}/scripts/${i}..."
                cp ${WORKDIR}/im_${i} ${ROOTDIR}/composer/byfn-network.json
	else
		if [ -h ${LINKDIR}/${i} ]
                then
                        #echo ${LINKDIR}/${i} is there
                        echo ${LINKDIR}/${i} verified
                else
                        ln -s ${WORKDIR}/im_${i} ${LINKDIR}/${i}
                fi
	fi
done

chmod 755 ${WORKDIR}/im_*.sh 
