# Updates of Address Entities

## Decision

It is not possible to update Address entities.

## Background

We need to differentiate between addresses as stand along entities (Address.java) and the different addresses which a partner can have (AddressDetail.java).

This decision is scoped to address entities.

If a partner changes address, then the Address Details need to be updated. They represent the relationship between partners and their addresses.

Actual physical addresses are stored in the Address entity.
These don't normally change. As such, they are immutable.
The reasons that an Address entity might change are:

1. An address needs to be modified because it is wrong
2. An address needs to be modified because the local government has changed it.

While both cases could be simplified with an update interface, it is risky to have such an interface, as a user who wants to change the address at which a partner is located, may not be aware of the distinction between the Address entity and the Address Detail entity, and then update the wrong one.

By not allowing updates of Address entities, we can ensure that the user will create new Address Detail entities, which is by far the more common case. 

If an address changes or is wrong, then the user should create a new Address entity, and update the Address Detail entities to use the new Address entity. Once the old address is no longer used, it can be deleted.

