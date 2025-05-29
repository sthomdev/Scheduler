from flask import Blueprint, jsonify, request
from models import Resource, Reservation, db
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

routes = Blueprint('routes', __name__)

socketio_instance = None

def init_routes(app, app_db, app_socketio):
    """Initializes the routes blueprint and registers it with the Flask app."""
    global socketio_instance
    socketio_instance = app_socketio
    app.register_blueprint(routes)

@routes.route('/resources', methods=['GET'])
def get_resources():
    """
    Get all resources
    ---
    responses:
      200:
        description: A list of resources
        schema:
          type: array
          items:
            $ref: '#/definitions/Resource'
    """
    resources = Resource.query.all()
    return jsonify([resource.to_dict() for resource in resources])

@routes.route('/resources/<int:resource_id>', methods=['GET'])
def get_resource_details(resource_id):
    """
    Get a specific resource by ID
    ---
    parameters:
      - name: resource_id
        in: path
        type: integer
        required: true
        description: The ID of the resource to retrieve
    responses:
      200:
        description: Details of the resource
        schema:
          $ref: '#/definitions/Resource'
      404:
        description: Resource not found
    """
    resource = Resource.query.get(resource_id)
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404
    return jsonify(resource.to_dict())

@routes.route('/reserve', methods=['POST'])
def reserve_resource():
    """
    Reserve a resource
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          $ref: '#/definitions/ReservationRequest' # Updated to use central definition
    responses:
      201:
        description: Reservation successful
        schema:
          $ref: '#/definitions/Reservation'
      400:
        description: Invalid request data or validation error
      404:
        description: Resource not found
      409:
        description: Time slot conflict
      500:
        description: Internal server error
    """
    data = request.json
    resource_id = data.get('resource_id')
    start_time_str = data.get('start_time')
    duration_minutes_str = data.get('duration_minutes') # Keep as string initially for int conversion
    description = data.get('description')

    if not all([resource_id, start_time_str, duration_minutes_str]):
        return jsonify({'error': 'Missing data: resource_id, start_time, or duration_minutes'}), 400

    try:
        start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        duration_minutes = int(duration_minutes_str) # Convert to int
        if duration_minutes <= 0:
            return jsonify({'error': 'Duration must be positive'}), 400
        end_time = start_time + timedelta(minutes=duration_minutes)
    except ValueError as e:
        return jsonify({'error': f'Invalid data format: {e}'}), 400

    resource = Resource.query.get(resource_id)
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404

    overlapping = Reservation.query.filter(
        Reservation.resource_id == resource_id,
        Reservation.start_time < end_time,
        Reservation.end_time > start_time
    ).first()

    if overlapping:
        return jsonify({'error': 'Time slot is already reserved or overlaps with an existing reservation'}), 409

    try:
        reservation = Reservation(
            resource_id=resource_id,
            start_time=start_time,
            end_time=end_time,
            description=description
        )
        db.session.add(reservation)
        db.session.commit()
        if socketio_instance: # Use the stored socketio_instance
            socketio_instance.emit('reservation_update', {'action': 'created', 'reservation': reservation.to_dict()})
        return jsonify(reservation.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Database integrity error. Perhaps the resource ID does not exist?'}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        # Consider using current_app.logger.error if logging is needed here
        return jsonify({'error': 'Could not process reservation due to a database error.'}), 500
    except Exception as e:
        db.session.rollback()
        # Consider using current_app.logger.error
        return jsonify({'error': 'An unexpected error occurred.'}), 500

@routes.route('/reservations', methods=['GET'])
def get_reservations():
    """
    Get all reservations
    ---
    responses:
      200:
        description: A list of all reservations
        schema:
          type: array
          items:
            $ref: '#/definitions/Reservation'
    """
    reservations = Reservation.query.all()
    return jsonify([reservation.to_dict() for reservation in reservations])

@routes.route('/availability/<int:resource_id>', methods=['GET'])
def check_availability(resource_id):
    """
    Check availability for a resource
    ---
    parameters:
      - name: resource_id
        in: path
        type: integer
        required: true
        description: The ID of the resource to check availability for
    responses:
      200:
        description: Availability information for the resource
        schema:
          type: object
          properties:
            resource_id:
              type: integer
            message:
              type: string
            reservations:
              type: array
              items:
                $ref: '#/definitions/Reservation'
      404:
        description: Resource not found
    """
    resource = Resource.query.get(resource_id)
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404

    reservations = Reservation.query.filter_by(resource_id=resource_id).all()
    return jsonify({
        'resource_id': resource_id,
        'message': 'This endpoint provides raw reservation data. Availability is best checked on the client or via a more specific query.',
        'reservations': [r.to_dict() for r in reservations]
    })

@routes.route('/reservations/<int:reservation_id>', methods=['DELETE'])
def delete_reservation(reservation_id):
    """
    Delete a reservation by ID
    ---
    parameters:
      - name: reservation_id
        in: path
        type: integer
        required: true
        description: The ID of the reservation to delete
    responses:
      200:
        description: Reservation cancelled successfully
      404:
        description: Reservation not found
      500:
        description: Internal server error
    """
    try:
        reservation = Reservation.query.get(reservation_id)
        if reservation:
            reservation_data = reservation.to_dict()
            db.session.delete(reservation)
            db.session.commit()
            if socketio_instance: # Use the stored socketio_instance
                socketio_instance.emit('reservation_update', {'action': 'deleted', 'reservation': reservation_data})
            return jsonify({'message': 'Reservation cancelled successfully'}), 200
        else:
            return jsonify({'error': 'Reservation not found'}), 404
    except SQLAlchemyError as e:
        db.session.rollback()
        # Consider using current_app.logger.error
        return jsonify({'error': 'Could not process cancellation due to a database error.'}), 500
    except Exception as e:
        db.session.rollback()
        # Consider using current_app.logger.error
        return jsonify({'error': 'An unexpected error occurred.'}), 500