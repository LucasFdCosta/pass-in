using Microsoft.EntityFrameworkCore;
using PassIn.Communication.Requests;
using PassIn.Communication.Responses;
using PassIn.Exceptions;
using PassIn.Infrastructure;
using System.Net.Mail;

namespace PassIn.Application.UseCases.Events.RegisterAttendee
{
    public class RegisterAttendeeOnEventUseCase
    {
        private readonly PassInDbContext _dbContext;

        public RegisterAttendeeOnEventUseCase()
        {
            _dbContext = new PassInDbContext();
        }

        public ResponseRegisteredJson Execute(Guid eventId, RequestRegisterEventJson request)
        {
            Validate(eventId, request);

            var entity = new Infrastructure.Entities.Attendee
            {
                Name = request.Name,
                Email = request.Email,
                Created_At = DateTime.UtcNow,
                Event_Id = eventId
            };

            _dbContext.Attendees.Add(entity);
            _dbContext.SaveChanges();

            return new ResponseRegisteredJson
            {
                Id = entity.Id,
            };
        }

        private void Validate(Guid eventId, RequestRegisterEventJson request)
        {
            var eventExist = _dbContext.Events.Find(eventId);

            if (eventExist is null) throw new NotFoundException("Event not found");

            if (string.IsNullOrWhiteSpace(request.Name)) throw new ErrorOnValidationException("Invalid data: 'name'");

            if (!IsEmailValid(request.Email)) throw new ErrorOnValidationException("Invalid data: 'email'");

            var attendeeAlreadyRegistered = _dbContext.Attendees.Any(at => at.Email.Equals(request.Email) && at.Event_Id == eventId);

            if (attendeeAlreadyRegistered) throw new ConflictException("Attendee is already registered on this event");

            var numberOfAttendees = _dbContext.Attendees.Count(at => at.Event_Id == eventId);

            if (numberOfAttendees >= eventExist.Maximum_Attendees) throw new ErrorOnValidationException("There is no room for this event.");
        }

        private bool IsEmailValid(string email)
        {
            try
            {
                new MailAddress(email);

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
