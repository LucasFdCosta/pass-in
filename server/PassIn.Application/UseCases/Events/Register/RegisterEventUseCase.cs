using PassIn.Communication.Requests;
using PassIn.Communication.Responses;
using PassIn.Exceptions;
using PassIn.Infrastructure;

namespace PassIn.Application.UseCases.Events.Register
{
    public class RegisterEventUseCase
    {
        public ResponseRegisteredEventJson Execute(RequestEventJson request)
        {
            Validate(request);

            var dbContext = new PassInDbContext();

            var entity = new Infrastructure.Entities.Event
            {
                Title = request.Title,
                Details = request.Details,
                Slug = request.Title.ToLower().Replace(" ", "-"),
                Maximum_Attendees = request.MaximumAttendees
            };

            dbContext.Events.Add(entity);
            dbContext.SaveChanges();

            return new ResponseRegisteredEventJson
            {
                Id = entity.Id,
            };
        }

        private void Validate(RequestEventJson request)
        {
            if (request.MaximumAttendees <= 0)
            {
                throw new PassInException("Invalid data: 'maximum attendees'");
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                throw new PassInException("Invalid data: 'title'");
            }
            
            if (string.IsNullOrWhiteSpace(request.Details))
            {
                throw new PassInException("Invalid data: 'details'");
            }
        }
    }
}
