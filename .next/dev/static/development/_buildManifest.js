self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [],
    "beforeFiles": [
      {
        "has": [
          {
            "type": "header",
            "key": "next-url",
            "value": "/dashboard(?:/.*)?"
          }
        ],
        "source": "/applications/:nxtPid",
        "destination": "/dashboard/(..)applications/:nxtPid"
      },
      {
        "has": [
          {
            "type": "header",
            "key": "next-url",
            "value": "/dashboard(?:/.*)?"
          }
        ],
        "source": "/applications/:nxtPid",
        "destination": "/dashboard/(..)applications/:nxtPid"
      }
    ],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()