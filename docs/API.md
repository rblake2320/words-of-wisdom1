# API Reference

Words of Wisdom uses **tRPC** to provide a type-safe API between the React client and the Express server. Procedures live in `server/routers.ts` and are served at `/trpc` by the running application.

## Access Levels

Public procedures are usable without a session. Protected procedures require an authenticated user. Administrative procedures require a session whose `role` is `admin`; they are enforced through the server-side admin guard rather than client-side UI visibility.

## Quotes

| Procedure          | Access         | Purpose                                                          |
| ------------------ | -------------- | ---------------------------------------------------------------- |
| `quotes.daily`     | Public query   | Returns the deterministic quote for the current calendar day.    |
| `quotes.random`    | Public query   | Returns a randomly selected quote, with an optional excluded ID. |
| `quotes.byId`      | Public query   | Returns one quote by identifier.                                 |
| `quotes.bySpeaker` | Public query   | Returns quotes associated with a selected speaker.               |
| `quotes.all`       | Public query   | Returns the searchable and filterable library.                   |
| `quotes.stats`     | Public query   | Returns live counts used in the product UI.                      |
| `quotes.topics`    | Public query   | Returns available topic values.                                  |
| `quotes.add`       | Admin mutation | Adds a sourced quote to the approved library.                    |
| `quotes.delete`    | Admin mutation | Removes a quote through the protected administrative flow.       |
| `quotes.seed`      | Admin mutation | Runs the idempotent seed process when appropriate.               |

Quote responses retain source information, including speaker attribution, source-video URL, title, category, and featured status. Clients must display attribution and should retain source links when sharing quotes.

## Favorites

| Procedure          | Access             | Purpose                                                    |
| ------------------ | ------------------ | ---------------------------------------------------------- |
| `favorites.ids`    | Protected query    | Returns the current user's saved quote IDs.                |
| `favorites.list`   | Protected query    | Returns the current user's saved quote records.            |
| `favorites.toggle` | Protected mutation | Adds or removes a quote from the current user's favorites. |

## Subscriptions

| Procedure              | Access             | Purpose                                               |
| ---------------------- | ------------------ | ----------------------------------------------------- |
| `subscriptions.get`    | Protected query    | Returns the user's current daily-email preference.    |
| `subscriptions.upsert` | Protected mutation | Creates or updates the user's daily-email preference. |

## Speakers and Authentication

| Procedure         | Access          | Purpose                                            |
| ----------------- | --------------- | -------------------------------------------------- |
| `speakers.all`    | Public query    | Returns the speaker directory.                     |
| `speakers.bySlug` | Public query    | Returns a speaker and associated quote collection. |
| `speakers.names`  | Public query    | Returns names used in filters.                     |
| `auth.me`         | Public query    | Returns the current authenticated user or `null`.  |
| `auth.logout`     | Public mutation | Clears the session cookie.                         |

## Errors

The client receives typed tRPC errors. Expected categories include `UNAUTHORIZED` for missing authentication, `FORBIDDEN` for unmet role requirements, `NOT_FOUND` for unavailable resources, `BAD_REQUEST` for invalid parameters, and `INTERNAL_SERVER_ERROR` for unexpected server faults. Production UI must show safe, actionable messages without exposing infrastructure details.
