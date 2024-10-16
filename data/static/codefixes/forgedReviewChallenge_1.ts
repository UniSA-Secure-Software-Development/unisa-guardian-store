module.exports = function productReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = security.authenticatedUsers.from(req)
    db.reviews.update(
    //"Assigning the author on the server side based on the user identified from the authentication token in the HTTP request is the correct approach. 
    //This ensures that users cannot simply include any author email of their choice in the request."
      { _id: req.body.id, author: user.data.email },
      { $set: { message: req.body.message, author: user.data.email } },
      { multi: true }
    ).then(
      (result: { modified: number, original: Array<{ author: any }> }) => {
        res.json(result)
      }, (err: unknown) => {
        res.status(500).json(err)
      })
  }
}