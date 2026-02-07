export type Gatherfi = {
  version: "0.1.0";
  name: "gatherfi";
  instructions: [
    {
      name: "createEvent";
      accounts: [
        {
          name: "event";
          isMut: true;
          isSigner: false;
        },
        {
          name: "organizer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "name";
          type: "string";
        },
        {
          name: "ticketPrice";
          type: "u64";
        },
        {
          name: "maxTickets";
          type: "u32";
        },
        {
          name: "exchangeRate";
          type: "u64";
        },
        {
          name: "city";
          type: {
            defined: "NigerianCity";
          };
        },
        {
          name: "category";
          type: {
            defined: "EventCategory";
          };
        }
      ];
    },
    {
      name: "buyTicket";
      accounts: [
        {
          name: "event";
          isMut: true;
          isSigner: false;
        },
        {
          name: "buyer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "buyerUsdc";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "ticketMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "buyerTicketAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mintAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "usdcMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "claimBackerProfit";
      accounts: [
        {
          name: "event";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userUsdc";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "withdrawOrganizer";
      accounts: [
        {
          name: "event";
          isMut: true;
          isSigner: false;
        },
        {
          name: "organizer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "organizerUsdc";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "Event";
      type: {
        kind: "struct";
        fields: [
          {
            name: "organizer";
            type: "publicKey";
          },
          {
            name: "name";
            type: "string";
          },
          {
            name: "ticketPriceUsdc";
            type: "u64";
          },
          {
            name: "nairaEquivalent";
            type: "u64";
          },
          {
            name: "exchangeRate";
            type: "u64";
          },
          {
            name: "maxTickets";
            type: "u32";
          },
          {
            name: "ticketsSold";
            type: "u32";
          },
          {
            name: "totalRevenue";
            type: "u64";
          },
          {
            name: "organizerWithdrawn";
            type: "u64";
          },
          {
            name: "platformWithdrawn";
            type: "u64";
          },
          {
            name: "active";
            type: "bool";
          },
          {
            name: "city";
            type: {
              defined: "NigerianCity";
            };
          },
          {
            name: "category";
            type: {
              defined: "EventCategory";
            };
          },
          {
            name: "createdAt";
            type: "i64";
          },
          {
            name: "eventDate";
            type: "i64";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "NigerianCity";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Lagos";
          },
          {
            name: "Abuja";
          },
          {
            name: "PortHarcourt";
          },
          {
            name: "Ibadan";
          },
          {
            name: "Kano";
          },
          {
            name: "BeninCity";
          },
          {
            name: "Enugu";
          },
          {
            name: "Aba";
          },
          {
            name: "Kaduna";
          },
          {
            name: "Ogbomosho";
          }
        ];
      };
    },
    {
      name: "EventCategory";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Owambe";
          },
          {
            name: "NaijaWedding";
          },
          {
            name: "ChurchProgram";
          },
          {
            name: "CampusEvent";
          },
          {
            name: "TechMeetup";
          },
          {
            name: "AfrobeatConcert";
          },
          {
            name: "BusinessSummit";
          },
          {
            name: "FashionShow";
          }
        ];
      };
    }
  ];
  events: [
    {
      name: "EventCreated";
      fields: [
        {
          name: "organizer";
          type: "publicKey";
          index: false;
        },
        {
          name: "event";
          type: "publicKey";
          index: false;
        },
        {
          name: "ticketPriceUsdc";
          type: "u64";
          index: false;
        },
        {
          name: "nairaPrice";
          type: "u64";
          index: false;
        },
        {
          name: "city";
          type: {
            defined: "NigerianCity";
          };
          index: false;
        },
        {
          name: "category";
          type: {
            defined: "EventCategory";
          };
          index: false;
        }
      ];
    },
    {
      name: "TicketPurchased";
      fields: [
        {
          name: "buyer";
          type: "publicKey";
          index: false;
        },
        {
          name: "event";
          type: "publicKey";
          index: false;
        },
        {
          name: "ticketPrice";
          type: "u64";
          index: false;
        },
        {
          name: "ticketNumber";
          type: "u32";
          index: false;
        }
      ];
    },
    {
      name: "OrganizerWithdrew";
      fields: [
        {
          name: "organizer";
          type: "publicKey";
          index: false;
        },
        {
          name: "event";
          type: "publicKey";
          index: false;
        },
        {
          name: "amount";
          type: "u64";
          index: false;
        }
      ];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "EventInactive";
      msg: "Event is inactive";
    },
    {
      code: 6001;
      name: "SoldOut";
      msg: "Event is sold out";
    },
    {
      code: 6002;
      name: "NothingToWithdraw";
      msg: "Nothing to withdraw";
    },
    {
      code: 6003;
      name: "MathOverflow";
      msg: "Math overflow";
    },
    {
      code: 6004;
      name: "NoTicketsSold";
      msg: "No tickets sold yet";
    }
  ];
};

export const IDL: Gatherfi = {
  version: "0.1.0",
  name: "gatherfi",
  instructions: [
    // ... (same as above)
  ],
  accounts: [
    // ... (same as above)
  ],
  types: [
    // ... (same as above)
  ],
  events: [
    // ... (same as above)
  ],
  errors: [
    // ... (same as above)
  ],
};