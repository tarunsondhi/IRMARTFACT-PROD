# IRM Crozier MVP

> This network tracks the transfer and condition reporting of artwork using HL composer. The initial code for this network is based on the `letters of credit` composer example. 

## Test

To view the full functionality of the application, run the command `npm test`. This will run 28 unit tests and showcase the main functionality of the network.

## Models within this business network

### Participants
`ArtStudio`, `ArtHandler`, `Collector`, `CollectionManager`

### Assets
`Artwork`

### Transactions
`CreateArtwork`, `RequestConditionReport`, `SubmitConditionReport`, `CrossCheckConditionReport`, `RequestOwnership`, `ActionOnOwnershipRequest`, `RequestTransportation`, `UpdateTransportation`, `DeliverArtwork`, `ReceiveArtwork` and `CreateDemoParticipants` (for initialization purposes)

### Events
Not yet implemented

## Example use of this Business network
Four parties track and trace the ownership and transit of artwork

## License <a name="license"></a>
Hyperledger Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Hyperledger Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

## Deployment

These are the steps to restart the network back to working condition (Removed)