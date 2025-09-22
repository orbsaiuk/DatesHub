export const structure = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Events")
        .child(
          S.list()
            .title("Events")
            .items([
              S.listItem()
                .title("All Events")
                .child(
                  S.documentList()
                    .title("All Events")
                    .filter("_type == 'event'")
                    .defaultOrdering([
                      { field: "startDate", direction: "desc" },
                    ])
                ),
              S.listItem()
                .title("Planned")
                .child(
                  S.documentList()
                    .title("Planned Events")
                    .filter("_type == 'event' && status == 'planned'")
                    .defaultOrdering([{ field: "startDate", direction: "asc" }])
                ),
              S.listItem()
                .title("Confirmed")
                .child(
                  S.documentList()
                    .title("Confirmed Events")
                    .filter("_type == 'event' && status == 'confirmed'")
                    .defaultOrdering([{ field: "startDate", direction: "asc" }])
                ),
              S.listItem()
                .title("In Progress")
                .child(
                  S.documentList()
                    .title("In Progress Events")
                    .filter("_type == 'event' && status == 'in-progress'")
                    .defaultOrdering([{ field: "startDate", direction: "asc" }])
                ),
              S.listItem()
                .title("Completed")
                .child(
                  S.documentList()
                    .title("Completed Events")
                    .filter("_type == 'event' && status == 'completed'")
                    .defaultOrdering([
                      { field: "startDate", direction: "desc" },
                    ])
                ),
              S.listItem()
                .title("Cancelled")
                .child(
                  S.documentList()
                    .title("Cancelled Events")
                    .filter("_type == 'event' && status == 'cancelled'")
                    .defaultOrdering([
                      { field: "startDate", direction: "desc" },
                    ])
                ),
            ])
        ),
      S.listItem()
        .title("Event Requests")
        .child(
          S.documentList()
            .title("Event Requests")
            .filter("_type == 'eventRequest'")
        ),
      S.divider(),
      S.listItem()
        .title("Companies")
        .child(
          S.documentList().title("Companies").filter("_type == 'company'")
        ),
      S.listItem()
        .title("Suppliers")
        .child(
          S.documentList()
            .title("Suppliers")
            .filter("_type == 'supplier' && tenantType == 'supplier'")
        ),
      S.listItem()
        .title("Offers")
        .child(
          S.list()
            .title("Offers")
            .items([
              S.listItem()
                .title("Company Offers")
                .child(
                  S.documentList()
                    .title("Company Offers")
                    .filter("_type == 'offers' && tenantType == 'company'")
                ),
              S.listItem()
                .title("Supplier Offers")
                .child(
                  S.documentList()
                    .title("Supplier Offers")
                    .filter("_type == 'offers' && tenantType == 'supplier'")
                ),
            ])
        ),
      S.listItem()
        .title("Blogs")
        .child(
          S.list()
            .title("Blogs")
            .items([
              S.listItem()
                .title("Pending Blogs")
                .child(
                  S.documentList()
                    .title("Pending Blogs")
                    .filter("_type == 'blog' && status == 'pending'")
                ),
              S.listItem()
                .title("Published Blogs")
                .child(
                  S.documentList()
                    .title("Published Blogs")
                    .filter("_type == 'blog' && status == 'published'")
                ),
              S.listItem()
                .title("Rejected Blogs")
                .child(
                  S.documentList()
                    .title("Rejected Blogs")
                    .filter("_type == 'blog' && status == 'rejected'")
                ),
            ])
        ),
      S.divider(),
      S.documentTypeListItem("category"),
      // Messaging
      S.listItem()
        .title("Messaging")
        .child(
          S.list()
            .title("Messaging")
            .items([
              S.listItem()
                .title("Conversations")
                .child(
                  S.documentList()
                    .title("Conversations")
                    .filter("_type == 'conversation'")
                    .defaultOrdering([
                      { field: "lastMessageAt", direction: "desc" },
                    ])
                    .child((conversationId) =>
                      S.documentList()
                        .title("Messages")
                        .filter(
                          "_type == 'message' && references($conversationId)"
                        )
                        .params({ conversationId })
                        .defaultOrdering([
                          { field: "createdAt", direction: "asc" },
                        ])
                    )
                ),
              S.listItem()
                .title("All Messages")
                .child(
                  S.documentList()
                    .title("All Messages")
                    .filter("_type == 'message'")
                    .defaultOrdering([
                      { field: "createdAt", direction: "desc" },
                    ])
                ),
            ])
        ),
      S.listItem()
        .title("Company Reviews")
        .child(
          S.list()
            .title("Company Reviews")
            .items([
              S.listItem()
                .title("Company Reviews")
                .child(
                  S.documentList()
                    .title("Company Reviews")
                    .filter("_type == 'review' && tenantType == 'company'")
                ),
            ])
        ),
      S.listItem()
        .title("Supplier Reviews")
        .child(
          S.list()
            .title("Supplier Reviews")
            .items([
              S.listItem()
                .title("Supplier Reviews")
                .child(
                  S.documentList()
                    .title("Supplier Reviews")
                    .filter("_type == 'review' && tenantType == 'supplier'")
                ),
            ])
        ),
      S.listItem()
        .title("User Reviews")
        .child(
          S.list()
            .title("User Reviews")
            .items([
              S.listItem()
                .title("User Reviews")
                .child(
                  S.documentList()
                    .title("User Reviews")
                    .filter("_type == 'review' && tenantType == 'user'")
                ),
            ])
        ),
      S.divider(),
      S.documentTypeListItem("siteSettings"),
      S.documentTypeListItem("user"),
      S.listItem()
        .title("Billing")
        .child(
          S.list()
            .title("Billing")
            .items([
              S.listItem()
                .title("Plans")
                .child(
                  S.documentList()
                    .title("Plans")
                    .filter("_type == 'plan'")
                    .defaultOrdering([{ field: "order", direction: "asc" }])
                ),
              S.listItem()
                .title("Subscriptions")
                .child(
                  S.documentList()
                    .title("Subscriptions")
                    .filter("_type == 'subscription'")
                    .defaultOrdering([
                      { field: "startDate", direction: "desc" },
                    ])
                ),
              S.listItem()
                .title("Payments")
                .child(
                  S.documentList()
                    .title("Payments")
                    .filter("_type == 'payment'")
                    .defaultOrdering([
                      { field: "transactionDate", direction: "desc" },
                    ])
                ),
            ])
        ),
      S.listItem()
        .title("Tenant Requests")
        .child(
          S.documentList()
            .title("Tenant Requests")
            .filter("_type == 'tenantRequest'")
        ),
    ]);
