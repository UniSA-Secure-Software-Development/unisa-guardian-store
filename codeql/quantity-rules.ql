import javascript
import DataFlow

/** Taint: user input (req.body / req.query / req.params) */
predicate isSource(DataFlow::Node n) {
  exists(PropertyAccess pa |
    pa.getPropertyName() = "body" or
    pa.getPropertyName() = "query" or
    pa.getPropertyName() = "params"
    and n.asExpr() = pa
  )
}

/** Sink: writing to .quantity */
predicate isSink(DataFlow::Node n) {
  exists(AssignExpr a |
    a.getLhs() instanceof PropertyAccess and
    a.getLhs().(PropertyAccess).getPropertyName() = "quantity" and
    n.asExpr() = a.getRhs()
  )
}

/** Run taint tracking (uses CodeQL's default flow rules) */
from DataFlow::PathNode src, DataFlow::PathNode sink
where isSource(src) and isSink(sink) and
      DataFlow::localFlow(src, sink)
select sink.getNode(),
  "User input flows into quantity. Source: " + src.getNode().toString()
