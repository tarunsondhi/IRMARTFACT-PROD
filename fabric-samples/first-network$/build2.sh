#!/bin/bash
#Author: Wilson Li
#Version: v.0.0.2
ROOTDIR=/home/ubuntu/fabric-samples
WORKDIR=${ROOTDIR}/first-network/imscripts
LINKDIR=${ROOTDIR}/first-network
COMPOSERDIR=${ROOTDIR}/composer
CONSORTIUM=CryptoAnchor
ORG1=IMInc
ORG1_low=iminc
DOMAIN=imblockchain.com
ORG2=Org2
ORG2_low=org2
ORG1ADM=wilson
ORG2ADM=jon
NETWORK=im-network
ORG1STRING=1:IMInc:iminc:ORG1:${ORG1ADM}
ORG2STRING=2:Org2:org2:ORG2:${ORG2ADM}
PKG=im-evidence-blockchain
PKGVER=0.0.2-deploy.1
PKGDIR=${WORKDIR}

#Creating new network
#echo ${WORKDIR}/byfn-network.json
awk -v netw=$NETWORK 'NF {sub(/byfn-network/, netw); printf "%s\n",$0;}' ${COMPOSERDIR}/byfn-network.json >${COMPOSERDIR}/${NETWORK}.json_net

#Processing Orderer CA Cert
	ORD_CA=`awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ${LINKDIR}/crypto-config/ordererOrganizations/${DOMAIN}/orderers/orderer.${DOMAIN}/tls/ca.crt`
	MOD_ORD_CA=`echo $ORD_CA|tr -d "\n"`
	echo "Editing Orderer CA"
	awk -v "ordca=$MOD_ORD_CA" 'NF {sub(/\INSERT_ORDERER_CA_CERT/, ordca); printf "%s\n",$0;}' ${COMPOSERDIR}/${NETWORK}.json_net >${COMPOSERDIR}/${NETWORK}.json_ordca


for i in  ${ORG1STRING} ${ORG2STRING}
do
	ORGID=`echo ${i}|awk -F\: '{print $1}'`
	ORG=`echo ${i}|awk -F\: '{print $2}'`
	ORGL=`echo ${i}|awk -F\: '{print $3}'`
	ORGU=`echo ${i}|awk -F\: '{print $4}'`
	ADM=`echo ${i}|awk -F\: '{print $5}'`
	mkdir -p ${COMPOSERDIR}/${ORGL}
	#ORG_CA="`awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' /home/ubuntu/fabric-samples/first-network/crypto-config/peerOrganizations/${ORGL}.${DOMAIN}/peers/peer0.${ORGL}.${DOMAIN}/tls/ca.crt`"
	if [ $ORGID = 1 ]
	then
		ORG_CA=`awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ${LINKDIR}/crypto-config/peerOrganizations/${ORGL}.${DOMAIN}/peers/peer0.${ORGL}.${DOMAIN}/tls/ca.crt`	
		MOD_ORG_CA=`echo $ORG_CA|tr -d "\n"`
		echo "Editing $ORGID CA"
		awk -v "orgcaa=$MOD_ORG_CA" 'NF {sub(/\INSERT_ORG1_CA_CERT/, orgcaa); printf "%s\n",$0;}' ${COMPOSERDIR}/${NETWORK}.json_ordca >${COMPOSERDIR}/${NETWORK}.json_org1ca
	elif [ $ORGID = 2 ]
	then
		ORG_CA=`awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' ${LINKDIR}/crypto-config/peerOrganizations/${ORGL}.${DOMAIN}/peers/peer0.${ORGL}.${DOMAIN}/tls/ca.crt`
                MOD_ORG_CA=`echo $ORG_CA|tr -d "\n"`
		echo "Editing $ORGID CA"
		awk -v "orgca=$MOD_ORG_CA" 'NF {sub(/\INSERT_ORG2_CA_CERT/, orgca); printf "%s\n",$0;}' ${COMPOSERDIR}/${NETWORK}.json_org1ca >${ROOTDIR}/composer/${NETWORK}.json_modca
	fi
	#awk -v orgca=${ORG_CA} '1;/INSERT_ORG1_CA_CERT/{ printf orgca}' ${ROOTDIR}/composer/byfn-network.json >${ROOTDIR}/composer/im_byfn-network.json
	#awk -v orgca=${MOD_ORG_CA} ';/INSERT_ORG1_CA_CERT/{ print orgca}' ${ROOTDIR}/composer/byfn-network.json >${ROOTDIR}/composer/im_byfn-network.json
	#sed -i -e "s/INSERT_ORG1_CA_CERT/'"$MOD_ORG_CA"'/g"  ${ROOTDIR}/composer/byfn-network.json
	#echo /home/ubuntu/fabric-samples/first-network/crypto-config/peerOrganizations/${ORGL}.${DOMAIN}/peers/peer0.${ORGL}.${DOMAIN}/tls/ca.crt
	#sed -n '/BEGIN CERTIFICATE/,/END CERTIFICATE/H;$!d;g;s/.*\(---BEGIN\)/\1/;w' /home/ubuntu/fabric-samples/first-network/crypto-config/peerOrganizations/${ORGL}.${DOMAIN}/peers/peer0.${ORGL}.${DOMAIN}/tls/ca.crt 
	awk -v "orgclient=$ORG" 'NF {sub(/\ORGREPLACE_HERE/, orgclient); printf "%s\n",$0;}' ${ROOTDIR}/composer/${NETWORK}.json_modca >${ROOTDIR}/composer/${NETWORK}.json
done

#Transfer package for deployment
cp  ${PKGDIR}/${PKG}.bna ${COMPOSERDIR}/

for j in  ${ORG1STRING} ${ORG2STRING}
do
	ORGID=`echo ${j}|awk -F\: '{print $1}'`
        ORG=`echo ${j}|awk -F\: '{print $2}'`
        ORGL=`echo ${j}|awk -F\: '{print $3}'`
        ORGU=`echo ${j}|awk -F\: '{print $4}'`
        ADM=`echo ${j}|awk -F\: '{print $5}'`
        cp ${LINKDIR}/crypto-config/peerOrganizations/${ORGL}.${DOMAIN}/users/Admin@${ORGL}.${DOMAIN}/msp/signcerts/A*.pem ${COMPOSERDIR}/${ORGL}/
        cp ${LINKDIR}/crypto-config/peerOrganizations/${ORGL}.${DOMAIN}/users/Admin@${ORGL}.${DOMAIN}/msp/keystore/*_sk ${COMPOSERDIR}/${ORGL}/

        cp ${COMPOSERDIR}/${NETWORK}.json ${COMPOSERDIR}/${ORGL}/${NETWORK}-${ORGL}.json

        composer card create -p ${COMPOSERDIR}/${ORGL}/${NETWORK}-${ORGL}.json -u PeerAdmin -c ${COMPOSERDIR}/${ORGL}/Admin@${ORGL}.${DOMAIN}-cert.pem -k ${COMPOSERDIR}/${ORGL}/*_sk -r PeerAdmin -r ChannelAdmin -f ${COMPOSERDIR}/${ORGL}/PeerAdmin@${NETWORK}-${ORGL}.card
        PWD=`pwd`
        cd ${COMPOSERDIR}/${ORGL}/
        composer card import -f ${COMPOSERDIR}/${ORGL}/PeerAdmin@${NETWORK}-${ORGL}.card --card PeerAdmin@${NETWORK}-${ORGL}
	echo "Please perform manual run for package deployment:"
	echo "cd ${COMPOSERDIR}/${ORGL}/"
	echo "composer network install --card PeerAdmin@PeerAdmin@${NETWORK}-${ORGL} --archiveFile ${PKGDIR}/${PKG}.bna"
	composer identity request -c PeerAdmin@${NETWORK}-${ORGL} -u admin -s adminpw -d ${ADM}
	composer card create -p ${COMPOSERDIR}/${ORGL}/${NETWORK}-${ORGL}.json -u ${ADM} -n ${PKG} -c ${ADM}/admin-pub.pem -k ${ADM}/admin-priv.pem
	composer card import -f ${COMPOSERDIR}/${ORGL}/${ADM}@${PKG}.card
	#composer network ping -c ${ADM}@${PKG}.card
	CMDPARM=${CMDPARM}" -A ${ADM} -C ${ADM}/admin-pub.pem"
        cd $PWD


done


#Start network
echo CMDPARM=$CMDPARM
echo "Please perform manual run for start the chaincode:"
echo "composer network start -c PeerAdmin@${NETWORK}-${ORGL} -n ${PKG}  -V ${PKGVER} -o endorsementPolicyFile=${COMPOSERDIR}/endorsement-policy.json ${CMDPARM}"


